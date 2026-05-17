import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string; // sera hashé — jamais le mot de passe en clair

    @Column({ default: 'user' })
    role!: 'admin' | 'user';

    @Column({ type: 'varchar', nullable: true, default: null })
    refreshToken!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}