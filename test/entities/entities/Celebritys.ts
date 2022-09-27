import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MovieCelebrity } from "./MovieCelebrity";

@Entity("celebritys", { schema: "douban" })
export class Celebritys {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", comment: "名字", length: 200 })
  name: string;

  @Column("varchar", { name: "icon", comment: "头像", length: 200 })
  icon: string;

  @Column("int", { name: "sex", comment: "性别" })
  sex: number;

  @Column("varchar", {
    name: "constellation",
    nullable: true,
    comment: "星座",
    length: 200,
    default: () => "'未知'",
  })
  constellation: string | null;

  @Column("varchar", {
    name: "birth",
    nullable: true,
    comment: "出生日期",
    length: 200,
    default: () => "'未知'",
  })
  birth: string | null;

  @Column("varchar", { name: "vocation", comment: "编剧", length: 45 })
  vocation: string;

  @Column("varchar", {
    name: "anotherName",
    nullable: true,
    comment: "别名",
    length: 200,
    default: () => "'无'",
  })
  anotherName: string | null;

  @Column("varchar", {
    name: "anotherChineseName",
    nullable: true,
    comment: "中文名",
    length: 200,
    default: () => "'无'",
  })
  anotherChineseName: string | null;

  @Column("varchar", {
    name: "indbLink",
    nullable: true,
    comment: "indbLink链接",
    length: 200,
    default: () => "'无'",
  })
  indbLink: string | null;

  @Column("varchar", {
    name: "web",
    nullable: true,
    comment: "官方网站",
    length: 200,
    default: () => "'无'",
  })
  web: string | null;

  @Column("text", { name: "desc", comment: "简介" })
  desc: string;

  @OneToMany(() => MovieCelebrity, (movieCelebrity) => movieCelebrity.celebrity)
  movieCelebrities: MovieCelebrity[];
}
