import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // 비밀번호 필드 포함 조회 (로그인에서 사용)
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.usersRepository.exist({ where: { email } });
  }

  async register(data: UserDto): Promise<void> {
    const normalized = {
      ...data,
      email: data.email.trim().toLowerCase(),
      username: data.username.trim(),
      nickname: data.nickname.trim(),
      phone: data.phone.replace(/\s+/g, ''),
    };

    const exists = await this.existsByEmail(normalized.email);
    if (exists) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }

    const user = {
      ...normalized,
      password: await bcrypt.hash(normalized.password, 12),
    };

    try {
      await this.usersRepository.save(user);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException('이미 사용중인 이메일입니다.');
      }
      throw err;
    }
  }
}
