import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Token {
  constructor(userId: number, token: string) {
    this.userId = userId;
    this.refreshToken = token;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  refreshToken: string;
}
