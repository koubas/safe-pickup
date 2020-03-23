'use strict';

import koaSls from 'aws-serverless-koa'
import app from './server.mjs'

export const api = koaSls(app)