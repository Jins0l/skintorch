import { Body, Controller, Delete, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserPayload } from 'src/auth/types/auth.types';
import { User } from 'src/common/decorator/user.decorator';


@ApiTags('Comments')
@ApiBearerAuth('access-token')
@Controller('posts')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments')
    @ApiOperation({ summary: '댓글 생성', description: '게시글에 댓글 추가' })
    async createComment(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() body: CreateCommentDto,
        @User() user: UserPayload,
    ) {
        return this.commentsService.createComment(postId, body, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments/:commentId/replies')
    @ApiOperation({ summary: '대댓글 생성', description: '댓글에 대한 답글 추가' })
    async createReply(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('commentId', ParseIntPipe) commentId: number,
        @Body() body: CreateCommentDto,
        @User() user: UserPayload,
    ) {
        return this.commentsService.createReply(postId, commentId, body, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':postId/comments/:commentId')
    @ApiOperation({ summary: '댓글 삭제', description: '댓글 삭제' })
    async deleteComment(@Param('postId', ParseIntPipe) postId: number, @Param('commentId', ParseIntPipe) commentId: number, @User() user: UserPayload) {
        return this.commentsService.deleteComment(postId, commentId, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':postId/comments/:commentId/replies/:replyId')
    @ApiOperation({ summary: '대댓글 삭제', description: '대댓글 삭제' })
    async deleteReply(@Param('postId', ParseIntPipe) postId: number, @Param('commentId', ParseIntPipe) commentId: number, @Param('replyId', ParseIntPipe) replyId: number, @User() user: UserPayload) {
        return this.commentsService.deleteReply(postId, commentId, replyId, user);
    }
}
