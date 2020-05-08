const axios = require('axios');
const Yup = require('yup');
const queue = require('./queue');

const logServer = process.env.LOG_SERVER;

const schema = Yup.object().shape({
    refId: Yup.string().required(),
    level: Yup.string().required(),
    service: Yup.string().required(),
    datetime: Yup.date().default(function() {
        return new Date();
    }),
    title: Yup.string().required(),
    message: Yup.string().required(),
});

class Uplog{
    constructor(option, queueProcessor){
        this.option = option;
        queueProcessor.process(this.process);
    }

    validate(){
        if(!this.option.schema){
            return new Promise((resolve, reject) => resolve(data));
        }

        return this.option.schema.validate(data);
    }

    queue(data){
        this.validate(data).then(data => {
            this.queueProcessor.add(data);
        }).cache(e => {
            // e : Validation error object
            console.log('validation error');
        });;
    }

    process(data, done){
        axios.post(this.option.url, {
            data
        }).then(data => {
            done();
        }).catch(e => {
            throw new Error(e);
        });
    }
}

const uplog = ((req, res, next) => {

    if(!logServer){
        throw new Error('No log server URL found. Please set env variable LOG_SERVER with full url of log server.');
    }

    const opt = {
        url: logServer,
        schema
    }

    req.logger = new Uplog(opt, queue());

    next();
});

module.exports = uplog;