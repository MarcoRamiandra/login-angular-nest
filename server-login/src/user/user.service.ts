import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    // trouver un user par email
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }

    // trouver un user par id
    async findById(id: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { id } });
    }

    // créer un nouveau user
    async create(data: Partial<User>): Promise<User> {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }

    // mettre à jour le refresh token stocké en base
    async updateRefreshToken(id: string, token: string | null): Promise<void> {
        await this.userRepo.update(id, { refreshToken: token });
    }
}