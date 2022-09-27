import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LongCommentRespond } from "./LongCommentRespond";
import { Movies } from "./Movies";
import { Users } from "./Users";
import { ReplierRelation } from "./ReplierRelation";

@Index("longComments_movie_id_idx", ["movieId"], {})
@Index("longComments_user_id_idx", ["userId"], {})
@Entity("longcomments", { schema: "douban" })
export class Longcomments {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "movie_id" })
  movieId: number;

  @Column("text", { name: "content" })
  content: string;

  @Column("bigint", { name: "date" })
  date: string;

  @Column("float", { name: "score", precision: 12 })
  score: number;

  @Column("tinyint", { name: "spoiler", comment: "是否剧透，0代表否，1代表是" })
  spoiler: number;

  @Column("varchar", { name: "title", length: 500 })
  title: string;

  @OneToMany(
    () => LongCommentRespond,
    (longCommentRespond) => longCommentRespond.longComment
  )
  longCommentResponds: LongCommentRespond[];

  @ManyToOne(() => Movies, (movies) => movies.longcomments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "movie_id", referencedColumnName: "id" }])
  movie: Movies;

  @ManyToOne(() => Users, (users) => users.longcomments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(
    () => ReplierRelation,
    (replierRelation) => replierRelation.longComment
  )
  replierRelations: ReplierRelation[];
}
