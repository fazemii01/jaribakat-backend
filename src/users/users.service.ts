import { Injectable, ConflictException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  private async seedDefaultAdmin() {
    try {
      const count = await this.userRepository.count();
      if (count === 0) {
        const hashedPassword = await bcrypt.hash('jaribakatadmin@1', 10);
        const defaultAdmin = this.userRepository.create({
          name: 'Admin JariBakat',
          email: 'admin@jaribakat.com',
          password: hashedPassword,
          role: 'admin',
        });
        await this.userRepository.save(defaultAdmin);
      }
    } catch (err) {
      console.error('Notice seeding default admin:', err?.message || err);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map(({ password, ...rest }) => rest as User);
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`Email ${dto.email} sudah terdaftar`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'admin',
    });

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Pengguna dengan ID ${id} tidak ditemukan`);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) {
        throw new ConflictException(`Email ${dto.email} sudah digunakan oleh pengguna lain`);
      }
      user.email = dto.email;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (dto.role) {
      user.role = dto.role;
    }

    if (dto.password && dto.password.trim().length > 0) {
      user.password = await bcrypt.hash(dto.password, 10);
    }

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Pengguna dengan ID ${id} tidak ditemukan`);
    }

    const totalAdmins = await this.userRepository.count({ where: { role: 'admin' } });
    if (user.role === 'admin' && totalAdmins <= 1) {
      throw new ConflictException('Tidak dapat menghapus satu-satunya akun Admin utama');
    }

    await this.userRepository.remove(user);
  }
}
