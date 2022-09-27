import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LongCommentRespond } from "./LongCommentRespond";
import { Users } from "./Users";

@Index("lcrr_lcr_idx", ["longCommentRespondId"], {})
@Index("lcrr_user_id_idx", ["userId"], {})
@Index("lcrr_user_res_id_idx", ["respondId"], {})
@Entity("long_comment_res_res", { schema: "douban" })
export class LongCommentResRes {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id", comment: "回复者的id" })
  userId: number;

  @Column("int", { name: "longCommentRespond_id", comment: "被回复的长评的id" })
  longCommentRespondId: number;

  @Column("int", { name: "respond_id", comment: "表示被回复者的id" })
  respondId: number;

  @Column("text", { name: "content" })
  content: string;

  @Column("bigint", { name: "date" })
  date: string;

  @ManyToOne(
    () => LongCommentRespond,
    (longCommentRespond) => longCommentRespond.longCommentResRes,
    { onDelete: "CASCADE", onUpdate: "CASCADE" }
  )
  @JoinColumn([{ name: "longCommentRespond_id", referencedColumnName: "id" }])
  longCommentRespond: LongCommentRespond;

  @ManyToOne(() => Users, (users) => users.longCommentResRes, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @ManyToOne(() => Users, (users) => users.longCommentResRes2, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "respond_id", referencedColumnName: "id" }])
  respond: Users;
}
