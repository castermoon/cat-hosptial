import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Movies } from "./Movies";
import { Users } from "./Users";

@Index("co_user_id_idx", ["userId"], {})
@Index("comment_movie_id_idx", ["movieId"], {})
@Entity("comments", { schema: "douban" })
export class Comments {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "content" })
  content: string;

  @Column("bigint", { name: "date" })
  date: string;

  @Column("int", { name: "score" })
  score: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "movie_id" })
  movieId: number;

  @Column("int", { name: "status" })
  status: number;

  @Column("varchar", { name: "labelList", nullable: true, length: 200 })
  labelList: string | null;

  @Column("tinyint", { name: "onlyMe", nullable: true, default: () => "'0'" })
  onlyMe: number | null;

  @Column("tinyint", { name: "isShare", nullable: true, default: () => "'1'" })
  isShare: number | null;

  @ManyToOne(() => Movies, (movies) => movies.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "movie_id", referencedColumnName: "id" }])
  movie: Movies;

  @ManyToOne(() => Users, (users) => users.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
