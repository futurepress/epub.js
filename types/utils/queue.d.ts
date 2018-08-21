import { defer } from "./core";

export interface QueuedTask {
  task: any | Task,
  args: any[],
  deferred: any, // should be defer, but not working
  promise: Promise<any>
}

export default class Queue {
  constructor(context: any);

  enqueue(func: Promise<Function> | Function, ...args: any[]): Promise<any>;

  dequeue(): Promise<QueuedTask>;

  dump(): void;

  run(): Promise<void>;

  flush(): Promise<void>;

  clear(): void;

  length(): number;

  pause(): void;

  stop(): void;
}

declare class Task {
  constructor(task: any, args: any[], context: any);
}
