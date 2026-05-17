import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]) // ← enregistre l'entité dans ce module
    ],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
