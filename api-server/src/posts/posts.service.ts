import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserPayload } from 'src/auth/types/auth.types';
import { Post } from 'src/entities/post.entity';
import { DataSource, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PostImage } from 'src/entities/post-image.entity';
import { UsersService } from 'src/users/users.service';
import { Comment } from 'src/entities/comment.entity';
import { Reply } from 'src/entities/reply.entity';

@Injectable()
export class PostsService {
    constructor(
        private readonly usersService: UsersService,
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
        @InjectRepository(PostImage)
        private readonly postImagesRepository: Repository<PostImage>,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Reply)
        private readonly replyRepository: Repository<Reply>,
    ) {}

    async getPosts(cursor?: number, limit = 20): Promise<{
        posts: Array<{
          id: number;
          title: string;
          content: string;
          createdAt: Date;
          user: { id: number; nickname: string } | null;
          thumbnail: { id: number; url: string } | null;
          commentsCount: number;
          likesCount: number;
        }>;
        pagination: { hasNextPage: boolean; nextCursor: number | null };
      }> {
        limit = Math.min(Math.max(limit ?? 20, 1), 100);
    
        const idQb = this.postsRepository
          .createQueryBuilder('post')
          .select('post.id', 'id')
          .orderBy('post.id', 'DESC')
          .take(limit + 1);
    
        if (cursor != null) {
          idQb.where('post.id < :cursor', { cursor });
        }
    
        const idRows = await idQb.getRawMany<{ id: number }>();
        const hasNextPage = idRows.length > limit;
        const pageIds = idRows.slice(0, limit).map((r) => r.id);
    
        if (pageIds.length === 0) {
          return { posts: [], pagination: { hasNextPage: false, nextCursor: null } };
        }
    
        const posts = await this.postsRepository
          .createQueryBuilder('post')
          .leftJoinAndSelect('post.user', 'user')
          .loadRelationCountAndMap('post.likesCount', 'post.likedUsers')
          .select(['post.id', 'post.title', 'post.content', 'post.createdAt', 'user.id', 'user.nickname'])
          .where('post.id IN (:...ids)', { ids: pageIds })
          .orderBy('post.id', 'DESC')
          .getMany();
    
        const [commentsAgg, repliesAgg, thumbs] = await Promise.all([
          this.commentRepository
            .createQueryBuilder('comment')
            .innerJoin('comment.post', 'post')
            .select('post.id', 'postId')
            .addSelect('COUNT(comment.id)', 'count')
            .where('post.id IN (:...ids)', { ids: pageIds })
            .groupBy('post.id')
            .getRawMany<{ postId: number; count: string }>(),
          this.replyRepository
            .createQueryBuilder('reply')
            .innerJoin('reply.comment', 'comment')
            .innerJoin('comment.post', 'post')
            .select('post.id', 'postId')
            .addSelect('COUNT(reply.id)', 'count')
            .where('post.id IN (:...ids)', { ids: pageIds })
            .groupBy('post.id')
            .getRawMany<{ postId: number; count: string }>(),
          this.postImagesRepository
            .createQueryBuilder('pi')
            .innerJoin(
              (qb) =>
                qb
                  .from(PostImage, 'pi2')
                  .select('pi2.postId', 'postId')
                  .addSelect('MIN(pi2.id)', 'minId')
                  .where('pi2.postId IN (:...ids)', { ids: pageIds })
                  .groupBy('pi2.postId'),
              'minpi',
              'minpi.postId = pi.postId AND minpi.minId = pi.id',
            )
            .select(['pi.postId AS postId', 'pi.id AS id', 'pi.url AS url'])
            .getRawMany<{ postId: number; id: number; url: string }>(),
        ]);
    
        const commentCountByPostId = new Map<number, number>();
        for (const row of commentsAgg) {
          commentCountByPostId.set(Number(row.postId), Number(row.count));
        }
        const replyCountByPostId = new Map<number, number>();
        for (const row of repliesAgg) {
          replyCountByPostId.set(Number(row.postId), Number(row.count));
        }
        const thumbByPostId = new Map<number, { id: number; url: string }>();
        for (const t of thumbs) {
          thumbByPostId.set(Number(t.postId), { id: Number(t.id), url: t.url });
        }
    
        for (const post of posts) {
          const c = commentCountByPostId.get(post.id) ?? 0;
          const r = replyCountByPostId.get(post.id) ?? 0;
          (post as any).commentsCount = c + r;
        }
    
        const serializedPosts = posts.map((post) => {
          const thumb = thumbByPostId.get(post.id);
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            user: post.user ? { id: post.user.id, nickname: post.user.nickname } : null,
            thumbnail: thumb ? { id: thumb.id, url: thumb.url } : null,
            commentsCount: (post as any).commentsCount ?? 0,
            likesCount: (post as any).likesCount ?? 0,
          };
        });
    
        const nextCursor = hasNextPage ? pageIds[pageIds.length - 1] : null;
    
        return { posts: serializedPosts, pagination: { hasNextPage, nextCursor } };
      }
    
      async createPost(body: CreatePostDto, user: UserPayload): Promise<{
        id: number;
        title: string;
        content: string;
        createdAt: Date;
        postImages: { id: number; url: string }[];
        user: { id: number; nickname: string };
      }> {
        const existUser = await this.usersService.findByEmail(user.email);
        if (!existUser) {
          throw new UnauthorizedException('존재하지 않는 사용자입니다.');
        }
    
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        const { title, content, images } = body;
    
        try {
          const post = await queryRunner.manager.save(Post, {
            title,
            content,
            user: { id: user.id },
          });
    
          let postImages: { id: number; url: string }[] = [];
          if (images && images.length > 0) {
            const postImagesData = images.map((image) => ({
              url: image,
              post: { id: post.id },
            }));
            const savedImages = await queryRunner.manager.save(PostImage, postImagesData);
            postImages = savedImages.map((img) => ({ id: img.id, url: img.url }));
          }
    
          await queryRunner.commitTransaction();
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            postImages,
            user: { id: user.id, nickname: user.nickname },
          };
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        } finally {
          await queryRunner.release();
        }
      }
    
      async getPost(id: number): Promise<any> {
        try {
          const data = await this.postsRepository.findOne({
            where: { id },
            relations: ['postImages', 'user', 'comments', 'comments.user', 'comments.replies', 'comments.replies.user'],
            order: {
              comments: {
                createdAt: 'ASC',
              },
            },
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              user: {
                id: true,
                nickname: true,
              },
              postImages: {
                id: true,
                url: true,
              },
              comments: {
                id: true,
                content: true,
                createdAt: true,
                user: {
                  id: true,
                  nickname: true,
                },
                replies: {
                  id: true,
                  content: true,
                  createdAt: true,
                  user: {
                    id: true,
                    nickname: true,
                  },
                },
              },
            },
          });
          if (!data) {
            throw new NotFoundException('존재하지 않는 게시물입니다.');
          }
    
          const [commentsCountRow, repliesCountRow, likesCount] = await Promise.all([
            this.commentRepository.createQueryBuilder('comment').where('comment.postId = :id', { id }).getCount(),
            this.replyRepository
              .createQueryBuilder('reply')
              .innerJoin('reply.comment', 'comment')
              .where('comment.postId = :id', { id })
              .getCount(),
            this.postsRepository
              .createQueryBuilder('post')
              .innerJoin('post.likedUsers', 'likedUser')
              .where('post.id = :id', { id })
              .getCount(),
          ]);
    
          const commentsCount = Number(commentsCountRow) + Number(repliesCountRow);
          return { ...data, commentsCount, likesCount } as any;
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        }
      }
    
      async likePost(postId: number, user: UserPayload): Promise<{ message: string }> {
        try {
          const existUser = await this.usersService.findById(user.id);
          if (!existUser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
          }
    
          const post = await this.postsRepository.findOne({ where: { id: postId } });
          if (!post) {
            throw new NotFoundException('존재하지 않는 게시물입니다.');
          }
    
          const likeCount = await this.postsRepository
            .createQueryBuilder('post')
            .leftJoin('post.likedUsers', 'likedUser')
            .where('post.id = :postId', { postId })
            .andWhere('likedUser.id = :userId', { userId: existUser.id })
            .getCount();
    
          if (likeCount > 0) {
            throw new BadRequestException('이미 좋아요를 누른 게시물입니다.');
          }
    
          await this.postsRepository.createQueryBuilder().relation(Post, 'likedUsers').of(postId).add(existUser.id);
    
          return { message: '좋아요를 눌렀습니다.' };
        } catch (error) {
          if (
            error instanceof NotFoundException ||
            error instanceof UnauthorizedException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        }
      }
    
      async unlikePost(postId: number, user: UserPayload): Promise<{ message: string }> {
        try {
          const existUser = await this.usersService.findById(user.id);
          if (!existUser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
          }
    
          const post = await this.postsRepository.findOne({ where: { id: postId } });
          if (!post) {
            throw new NotFoundException('존재하지 않는 게시물입니다.');
          }
    
          const likeCount = await this.postsRepository
            .createQueryBuilder('post')
            .leftJoin('post.likedUsers', 'likedUser')
            .where('post.id = :postId', { postId })
            .andWhere('likedUser.id = :userId', { userId: existUser.id })
            .getCount();
    
          if (likeCount === 0) {
            throw new BadRequestException('좋아요를 누르지 않은 게시물입니다.');
          }
    
          await this.postsRepository.createQueryBuilder().relation(Post, 'likedUsers').of(postId).remove(existUser.id);
    
          return { message: '좋아요를 취소했습니다.' };
        } catch (error) {
          if (
            error instanceof NotFoundException ||
            error instanceof UnauthorizedException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        }
      }

      async deletePost(postId: number, user: UserPayload): Promise<{ message: string }> {
        try {
          const post = await this.postsRepository.findOne({
            where: { id: postId },
            relations: ['user']
          });
          if (!post) {
            throw new NotFoundException('존재하지 않는 게시물입니다.');
          }
          if (post.user.id !== user.id) {
            throw new UnauthorizedException('삭제 권한이 없습니다.');
          }
          await this.postsRepository.softDelete(postId);
          return { message: '게시글이 삭제되었습니다.' };
        } catch (error) {
          if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
            throw error;
          }
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        }
      }
}
