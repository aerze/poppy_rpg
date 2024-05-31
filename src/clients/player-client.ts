import { Mini } from "./mini";
const mini = new Mini();
(<any>window).mini = mini;
mini.scenes.open("main");
