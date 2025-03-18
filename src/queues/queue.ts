import { addAtIndex } from "utils/sortingUtils";

export type QueueTask = Partial<{
  priority: number;
  privileged: boolean;
}>;

type QueueState = {
  pending: boolean;
};

type QueueParams<T extends QueueTask> = {
  executeTask: ExecuteTask<T>;
};

type GetQueue<T extends QueueTask> = () => T[];
type SetQueue<T extends QueueTask> = (newQueue: T[]) => void;
type GetTask<T extends QueueTask> = (f: (task: T) => boolean) => T | undefined;
type SetTask<T extends QueueTask> = (task: T, i?: number) => T;
type ExecuteTask<T extends QueueTask> = (f: (task: T) => boolean | Promise<boolean>) => void;

export interface Queue<T extends QueueTask> {
  getQueue: GetQueue<T>;
  setQueue: SetQueue<T>;
  getTask: GetTask<T>;
  setTask: SetTask<T>;
}

export const createQueue = <T extends QueueTask>({ executeTask }: QueueParams<T>): Queue<T> => {
  let queue: T[] = [];
  let inProgressTask: T | undefined

  const execute = async () => {
    const task = queue.shift()

    if (task === undefined) return
    
  }
  
  const getQueue: GetQueue<T> = () => [...queue];

  const setQueue: SetQueue<T> = (newQueue) => {
    queue = newQueue;
  };

  const getTask: GetTask<T> = (f) => queue.find(f);

  const setTask: SetTask<T> = (task, i) => {
    if (i === undefined) {
      queue.push(task);
    } else {
      queue = addAtIndex(queue, task, i);
    }

    queue = queue.sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) {
        return b.priority - a.priority;
      }

      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;

      return 0;
    });
  };

  return {
    getQueue,
    setQueue,
    getTask,
    setTask,
  };
};
