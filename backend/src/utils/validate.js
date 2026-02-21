const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });
    req.body = value;
    next();
};

const schemas = {
    siweVerify: Joi.object({
        message: Joi.string().required(),
        signature: Joi.string().required(),
    }),
    registerNode: Joi.object({
        nodeType: Joi.string().valid('GPU', 'Storage', 'Relay').required(),
        metadata: Joi.object().optional(),
    }),
    createJob: Joi.object({
        taskCID: Joi.string().required(),
        payment: Joi.number().positive().required(),
        minRep: Joi.number().integer().min(0).max(100).default(50),
    }),
    submitResult: Joi.object({
        resultCID: Joi.string().required(),
        txHash: Joi.string().optional(),
    }),
    createProfile: Joi.object({
        name: Joi.string().min(2).max(64).required(),
        clusterId: Joi.string().required(),
        projects: Joi.array().items(Joi.string()).min(1).required(),
        fingerprint: Joi.object().default({}),
        wallets: Joi.array().default([]),
    }),
    addProxy: Joi.object({
        endpoint: Joi.string().required(),
        protocol: Joi.string().valid('socks5', 'http').required(),
        country: Joi.string().required(),
        city: Joi.string().required(),
        provider: Joi.string().required(),
        trafficLeft: Joi.number().positive().required(),
        pricePerGB: Joi.number().positive().required(),
    }),
    assignProxy: Joi.object({
        proxyId: Joi.string().required(),
        profileId: Joi.string().required(),
    }),
    buyTraffic: Joi.object({
        provider: Joi.string().valid('GonzoProxy', 'ProxyCheap', 'BrightData').required(),
        gigabytes: Joi.number().valid(1, 5, 10, 50, 100).required(),
    }),
    createCluster: Joi.object({
        name: Joi.string().min(2).max(64).required(),
        location: Joi.string().optional(),
    }),
    vmAction: Joi.object({
        vmName: Joi.string().required(),
    }),
    saveSettings: Joi.object({
        autoOptimize: Joi.boolean().required(),
        switchThreshold: Joi.number().min(1).max(100).required(),
        includedProjects: Joi.array().items(Joi.string()).min(1).required(),
    }),
};

module.exports = { validate, schemas };
