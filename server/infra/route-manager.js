import FS from 'fs';

import express from 'express';

import React from 'react'
import {renderToString} from 'react-dom/server';
import {match, RoutingContext} from 'react-router';

import baseManager from './base-manager';

const routeManager = Object.assign({}, baseManager, {
    configureDevelopmentEnv(app) {
        const apiRouter = this.createApiRouter();
        const pagesRouter = this.createPageRouter();
        app.use('/api', apiRouter);            
        app.use('/', pagesRouter);            
    },

    createPageRouter() {
        const router = express.Router();
        
        /* Create page routes here */

        router.get('*', (req, res) => {
            res.render('index');
        });

        return router;
    },

    createApiRouter(app) {
        const router = express.Router();

        /* Create API calls here */

        return router;
    },
});

export default routeManager;