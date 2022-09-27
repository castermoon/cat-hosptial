import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Celebritys } from "./Celebritys";
import { Movies } from "./Movies";

@Index("fk_cele_id_idx", ["celebrityId"], {})
@Index("fk_movie_id_idx", ["movieId"], {})
@Entity("movie_celebrity", { schema: "douban" })
export class MovieCelebrity {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "movie_id" })
  movieId: number;

  @Column("int", { name: "celebrity_id" })
  celebrityId: number;

  @Column("varchar", { name: "position", length: 200 })
  position: string;

  @ManyToOne(() => Celebritys, (celebritys) => celebritys.movieCelebrities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "celebrity_id", referencedColumnName: "id" }])
  celebrity: Celebritys;

  @ManyToOne(() => Movies, (movies) => movies.movieCelebrities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "movie_id", referencedColumnName: "id" }])
  movie: Movies;
}
