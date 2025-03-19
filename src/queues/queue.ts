import { addAtIndex } from "utils/sortingUtils";

enum QueueMode {
  Normal,
  Privileged,
}

export type QueueTask = Partial<{
  priority: number;
  privileged: boolean;
}>;

type GetQueue<T extends QueueTask> = () => T[];
type SetQueue<T extends QueueTask> = (newQueue: T[]) => void;
type GetTask<T extends QueueTask> = (f: (task: T) => boolean) => T | undefined;
type SetTask<T extends QueueTask> = (task: T, i?: number) => void;
type Reset = () => void;
export type ExecuteTask<T extends QueueTask> = (task: T) => void | Promise<void>;

export interface IQueue<T extends QueueTask> {
  getQueue: GetQueue<T>;
  setQueue: SetQueue<T>;
  getTask: GetTask<T>;
  setTask: SetTask<T>;
  reset: Reset
}

type QueueParams<T extends QueueTask> = {
  executeTask: ExecuteTask<T>;
};

export const createQueue = <T extends QueueTask>({ executeTask }: QueueParams<T>): IQueue<T> => {
  let queue: T[] = [];
  let mode: QueueMode = QueueMode.Normal as QueueMode;
  let taskInProgress: T | undefined;

  const execute = async () => {
    if (taskInProgress) return;

    const task = queue[0];

    if (task === undefined) return;

    queue = queue.slice(1);
    taskInProgress = task;
    await executeTask(task);
    taskInProgress = undefined;

    if (mode === QueueMode.Privileged && queue.length === 0) {
      mode = QueueMode.Normal
    }
    
    execute();
  };

  const reset = () => {
    queue = []
    mode = QueueMode.Normal
  }
  
  const getQueue: GetQueue<T> = () => [...queue];

  const setQueue: SetQueue<T> = (newQueue) => {
    reset()
    queue = [...newQueue];
    execute();
  };

  const getTask: GetTask<T> = (f) => queue.find(f);

  const setTask: SetTask<T> = (task, i) => {
    if (mode === QueueMode.Privileged && !task.privileged) return;

    if (task.privileged) {
      mode = QueueMode.Privileged
      queue = [task];
    } else {
      queue = i === undefined ? [...queue, task] : addAtIndex(queue, task, i);
      queue = queue.sort((a, b) => {
        if (a.priority !== undefined && b.priority !== undefined) {
          return b.priority - a.priority;
        }

        if (a.priority !== undefined) return -1;
        if (b.priority !== undefined) return 1;

        return 0;
      });
    }

    execute();
  };

  return {
    getQueue,
    setQueue,
    getTask,
    setTask,
    reset
  };
};
