import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { PostImage } from '../entities/post-image.entity';
import { User } from '../entities/user.entity';
import { Comment } from '../entities/comment.entity';
import { Reply } from 'src/entities/reply.entity';

export const databaseTestConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'skintorch_test',
  entities: [Post, PostImage, User, Comment, Reply],
  synchronize: true,
  logging: false,
  charset: 'utf8mb4',
  dropSchema: true,
};