import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comments } from "./Comments";
import { Longcomments } from "./Longcomments";
import { MovieCelebrity } from "./MovieCelebrity";

@Entity("movies", { schema: "douban" })
export class Movies {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", comment: "名字", length: 200 })
  name: string;

  @Column("varchar", { name: "cover", comment: "封面", length: 200 })
  cover: string;

  @Column("varchar", { name: "type", comment: "类型", length: 200 })
  type: string;

  @Column("varchar", { name: "web", comment: "官方网站", length: 200 })
  web: string;

  @Column("varchar", { name: "country", comment: "制片国家/地区", length: 200 })
  country: string;

  @Column("varchar", { name: "language", comment: "语言", length: 200 })
  language: string;

  @Column("date", { name: "time", comment: "上映时间" })
  time: string;

  @Column("int", { name: "timeLen", comment: "时长" })
  timeLen: number;

  @Column("varchar", {
    name: "anotherName",
    nullable: true,
    comment: "别名",
    length: 200,
    default: () => "'无'",
  })
  anotherName: string | null;

  @Column("varchar", {
    name: "indbLink",
    nullable: true,
    comment: "indb链接",
    length: 200,
    default: () => "'无'",
  })
  indbLink: string | null;

  @Column("text", { name: "brief", comment: "剧情简介" })
  brief: string;

  @Column("float", { name: "score", precision: 12 })
  score: number;

  @OneToMany(() => Comments, (comments) => comments.movie)
  comments: Comments[];

  @OneToMany(() => Longcomments, (longcomments) => longcomments.movie)
  longcomments: Longcomments[];

  @OneToMany(() => MovieCelebrity, (movieCelebrity) => movieCelebrity.movie)
  movieCelebrities: MovieCelebrity[];
}
