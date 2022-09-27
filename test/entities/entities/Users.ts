import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comments } from "./Comments";
import { LongCommentResRes } from "./LongCommentResRes";
import { LongCommentRespond } from "./LongCommentRespond";
import { Longcomments } from "./Longcomments";
import { ReplierRelation } from "./ReplierRelation";

@Entity("users", { schema: "douban" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "username", length: 200 })
  username: string;

  @Column("varchar", { name: "password", length: 200 })
  password: string;

  @Column("varchar", { name: "nickname", length: 200 })
  nickname: string;

  @OneToMany(() => Comments, (comments) => comments.user)
  comments: Comments[];

  @OneToMany(
    () => LongCommentResRes,
    (longCommentResRes) => longCommentResRes.user
  )
  longCommentResRes: LongCommentResRes[];

  @OneToMany(
    () => LongCommentResRes,
    (longCommentResRes) => longCommentResRes.respond
  )
  longCommentResRes2: LongCommentResRes[];

  @OneToMany(
    () => LongCommentRespond,
    (longCommentRespond) => longCommentRespond.user
  )
  longCommentResponds: LongCommentRespond[];

  @OneToMany(() => Longcomments, (longcomments) => longcomments.user)
  longcomments: Longcomments[];

  @OneToMany(
    () => ReplierRelation,
    (replierRelation) => replierRelation.replier
  )
  replierRelations: ReplierRelation[];

  @OneToMany(
    () => ReplierRelation,
    (replierRelation) => replierRelation.respondent
  )
  replierRelations2: ReplierRelation[];
}
