import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class PostImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @ManyToOne(() => Post, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'postId', referencedColumnName: 'id' }])
  post: Post;
}
