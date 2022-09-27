import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LongCommentResRes } from "./LongCommentResRes";
import { Longcomments } from "./Longcomments";
import { Users } from "./Users";

@Index("longComRes_user_id_idx", ["userId"], {})
@Index("longComRes_longComent_id_idx", ["longCommentId"], {})
@Entity("long_comment_respond", { schema: "douban" })
export class LongCommentRespond {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("int", { name: "longComment_id" })
  longCommentId: number;

  @Column("text", { name: "content" })
  content: string;

  @Column("bigint", { name: "date" })
  date: string;

  @OneToMany(
    () => LongCommentResRes,
    (longCommentResRes) => longCommentResRes.longCommentRespond
  )
  longCommentResRes: LongCommentResRes[];

  @ManyToOne(
    () => Longcomments,
    (longcomments) => longcomments.longCommentResponds,
    { onDelete: "CASCADE", onUpdate: "CASCADE" }
  )
  @JoinColumn([{ name: "longComment_id", referencedColumnName: "id" }])
  longComment: Longcomments;

  @ManyToOne(() => Users, (users) => users.longCommentResponds, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;
}
