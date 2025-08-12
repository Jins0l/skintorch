import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Reply } from './reply.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 600 })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Post, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'postId', referencedColumnName: 'id' }])
  post: Post;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => Reply, (reply) => reply.comment, { nullable: true })
  replies: Reply[];
}
