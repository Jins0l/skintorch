import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "./user.entity";

@Entity()
export class Reply {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: false, length: 600 })
    content: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => Comment, { createForeignKeyConstraints: false })
    @JoinColumn([{ name: 'commentId', referencedColumnName: 'id' }])
    comment: Comment;

    @ManyToOne(() => User, { createForeignKeyConstraints: false })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
    user: User;
}