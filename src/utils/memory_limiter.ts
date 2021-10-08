import pidusage from "pidusage";

const pid = process.pid;

const limitProcessMemory = (memoryCheckIntervalTimeout: number, memoryLimitInBytes: number, mainCodeFunction: VoidFunction, exitCleanupCodeFunction: VoidFunction) => {
    mainCodeFunction();
    let dying = false;
    setInterval(function () {
        pidusage(pid, (_, result) => {
            if (result === null || result === undefined) return;

            if (result.memory > memoryLimitInBytes && dying === false) {
                exitCleanupCodeFunction();
                dying = true;
            }
        });
    }, memoryCheckIntervalTimeout);
}

export { limitProcessMemory }