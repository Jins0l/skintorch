import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/post.entity';
import { PostImage } from 'src/entities/post-image.entity';
import { UsersModule } from 'src/users/users.module';
import { Comment } from 'src/entities/comment.entity';
import { Reply } from 'src/entities/reply.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostImage, Comment, Reply]),
    UsersModule
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService]
})
export class PostsModule {}
