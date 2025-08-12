import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PostImage } from './post-image.entity';
import { Comment } from './comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 120 })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => PostImage, (postImage) => postImage.post, { nullable: true })
  postImages: PostImage[];

  @OneToMany(() => Comment, (comment) => comment.post, { nullable: true })
  comments: Comment[];

  @ManyToMany(() => User, (user) => user.likedPosts, { createForeignKeyConstraints: false })
  @JoinTable()
  likedUsers: User[];

  // relation count mapping fields (not persisted)
  commentsCount?: number;
  likesCount?: number;
}
