const axios = require('axios');
const Yup = require('yup');
const queue = require('./queue')();

const logServer = process.env.LOG_SERVER;

const schema = Yup.object().shape({
    refId: Yup.string().required(),
    level: Yup.string().required(),
    service: Yup.string().required(),
    datetime: Yup.date().default(function() {
        return new Date();
    }),
    message: Yup.string().required(),
});

const processQueue = (job, done) => {
    const { data } = job;
    
    axios.post(logServer, data).then(data => {
        done();
    }).catch(e => {
        throw new Error(e);
    });
}

queue.process(processQueue);

class Uplog{
    constructor(options){
        this.options = options;
        this.schema = this.options.schema || schema;
    }

    validate(data){
        return this.schema.validate(data);
    }

    queue(data){
        this.validate(data).then(data => {
            queue.add(data);
        }).catch(e => {
            // e : Validation error object
            throw Error('Error validation of log data: ' + JSON.stringify(e));
        });;
    }

}

const uplog = ((req, res, next) => {

    if(!logServer){
        throw new Error('No log server URL found. Please set env variable LOG_SERVER with full url of log server.');
    }

    const opt = {
        url: logServer
    }

    req.logger = new Uplog(opt, queue);

    next();
});

module.exports = { uplog, Uplog };