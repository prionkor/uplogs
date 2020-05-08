const Queue = require('bull');

const queueName = process.env.LOG_QUEUE_NAME || 'uplog';
const redisQueueUri = process.env.LOG_REDIS_QUEUE_URI || 'redis://127.0.0.1:6379';
const logQueueRateMax = process.env.LOG_QUEUE_RATE_MAX || 10;
const logQueueRateDuration = process.env.LOG_QUEUE_RATE_DURATION || 5000;

const queue = () => {

    if(!redisQueueUri){
        throw new Error('Log queue Redis URI (LOG_REDIS_QUEUE_URI) is not set.')
    }

    return new Queue(queueName, redisQueueUri, {
        limiter: {
            max: logQueueRateMax,
            duration: logQueueRateDuration,
        }
    });
}

module.exports = queue;