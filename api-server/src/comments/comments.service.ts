import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPayload } from 'src/auth/types/auth.types';
import { Comment } from 'src/entities/comment.entity';
import { Reply } from 'src/entities/reply.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
    constructor(
        private readonly postsService: PostsService,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Reply)
        private readonly replyRepository: Repository<Reply>,
        private readonly usersService: UsersService,
    ) {}

    async createComment(
        postId: number,
        body: CreateCommentDto,
        user: UserPayload,
      ): Promise<{ id: number; content: string; createdAt: Date; user: { id: number; nickname: string } }> {
        try {
          if (body.content.trim() === '') {
            throw new BadRequestException('댓글은 공백일 수 없습니다.');
          }
          const existUser = await this.usersService.findByEmail(user.email);
          if (!existUser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
          }
    
          const post = await this.postsService.getPost(postId);
          if (!post) {
            throw new NotFoundException('존재하지 않는 게시물입니다.');
          }
    
          const comment = await this.commentRepository.save({
            content: body.content,
            post: { id: post.id },
            user: { id: user.id },
          });
    
          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            user: { id: user.id, nickname: user.nickname },
          };
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

      async createReply(
        postId: number,
        commentId: number,
        body: CreateCommentDto,
        user: UserPayload,
      ): Promise<{ id: number; content: string; createdAt: Date; user: { id: number; nickname: string } }> {
        try {
          if (body.content.trim() === '') {
            throw new BadRequestException('댓글은 공백일 수 없습니다.');
          }
          const existUser = await this.usersService.findByEmail(user.email);
          if (!existUser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
          }
    
          const post = await this.postsService.getPost(postId);
          if (!post) {
            throw new NotFoundException('존재하지 않는 게시물입니다.');
          }
    
          const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['post'],
          });
          if (!comment) {
            throw new NotFoundException('존재하지 않는 댓글입니다.');
          }
    
          if (!comment.post || post.id !== comment.post.id) {
            throw new BadRequestException('존재하지 않는 댓글입니다.');
          }
    
          const reply = await this.replyRepository.save({
            content: body.content,
            user: { id: user.id },
            comment: { id: comment.id },
          });
    
          return {
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt,
            user: { id: user.id, nickname: user.nickname },
          };
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

      async deleteComment(postId: number, commentId: number, user: UserPayload): Promise<{ message: string }> {
        try {
          const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['post', 'user']
          });
          if (!comment) {
            throw new NotFoundException('존재하지 않는 댓글입니다.');
          }
          if (comment.post.id !== postId) {
            throw new BadRequestException('존재하지 않는 댓글입니다.');
          }
          if (comment.user.id !== user.id) {
            throw new UnauthorizedException('삭제 권한이 없습니다.');
          }
          await this.commentRepository.softDelete(commentId);
          return { message: '댓글이 삭제되었습니다.' };
        } catch (error) {
          if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        }
      }

      async deleteReply(postId: number, commentId: number, replyId: number, user: UserPayload): Promise<{ message: string }> {
        try {
          const reply = await this.replyRepository.findOne({
            where: { id: replyId },
            relations: ['comment', 'comment.post', 'comment.user', 'user']
          });
          if (!reply) {
            throw new NotFoundException('존재하지 않는 대댓글입니다.');
          }
          if (reply.comment.post.id !== postId) {
            throw new BadRequestException('존재하지 않는 대댓글입니다.');
          }
          if (reply.user.id !== user.id) {
            throw new UnauthorizedException('삭제 권한이 없습니다.');
          }
          await this.replyRepository.softDelete(replyId);
          return { message: '대댓글이 삭제되었습니다.' };
        } catch (error) {
          if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다.');
        }
    }
}
