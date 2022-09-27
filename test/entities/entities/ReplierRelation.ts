import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Longcomments } from "./Longcomments";

@Index("respondent_id_idx", ["respondentId"], {})
@Index("replier _user_id_idx", ["replierId"], {})
@Index("replier_longcomment_id_idx", ["longCommentId"], {})
@Entity("replier_relation", { schema: "douban" })
export class ReplierRelation {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "replier_id" })
  replierId: number;

  @Column("int", { name: "respondent_id" })
  respondentId: number;

  @Column("int", { name: "longComment_id" })
  longCommentId: number;

  @Column("int", { name: "scrollTop" })
  scrollTop: number;

  @Column("bigint", { name: "date" })
  date: string;

  @ManyToOne(() => Users, (users) => users.replierRelations, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "replier_id", referencedColumnName: "id" }])
  replier: Users;

  @ManyToOne(
    () => Longcomments,
    (longcomments) => longcomments.replierRelations,
    { onDelete: "CASCADE", onUpdate: "CASCADE" }
  )
  @JoinColumn([{ name: "longComment_id", referencedColumnName: "id" }])
  longComment: Longcomments;

  @ManyToOne(() => Users, (users) => users.replierRelations2, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "respondent_id", referencedColumnName: "id" }])
  respondent: Users;
}
