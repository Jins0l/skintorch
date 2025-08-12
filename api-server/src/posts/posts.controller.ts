import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { User } from 'src/common/decorator/user.decorator';
import { UserPayload } from 'src/auth/types/auth.types';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetPostsDto } from './dto/get-posts.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth('access-token')
@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({ summary: '게시글 목록', description: '커서 기반 페이지네이션' })
  async getPosts(@Query() query: GetPostsDto) {
    return this.postsService.getPosts(query?.cursor, query?.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: '게시글 단건 조회', description: '게시글 ID로 상세 조회' })
  async getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '게시글 생성', description: '새 게시글 작성' })
  async createPost(@Body() body: CreatePostDto, @User() user: UserPayload) {
    return this.postsService.createPost(body, user);
  }


  @UseGuards(JwtAuthGuard)
  @Post(':postId/likes')
  @ApiOperation({ summary: '게시글 좋아요', description: '게시글에 좋아요 추가' })
  async likePost(@Param('postId', ParseIntPipe) postId: number, @User() user: UserPayload) {
    return this.postsService.likePost(postId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId/likes')
  @ApiOperation({ summary: '게시글 좋아요 취소', description: '좋아요 취소' })
  async unlikePost(@Param('postId', ParseIntPipe) postId: number, @User() user: UserPayload) {
    return this.postsService.unlikePost(postId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  @ApiOperation({ summary: '게시글 삭제', description: '게시글 삭제' })
  async deletePost(@Param('postId', ParseIntPipe) postId: number, @User() user: UserPayload) {
    return this.postsService.deletePost(postId, user);
  }
}
