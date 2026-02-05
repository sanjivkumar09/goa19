const express = require('express');
const path = require('path');

const configViewEngine = (app) => {
    // Use absolute path for static files (works on all environments)
    app.use(express.static(path.join(__dirname, '../public')));
    app.set('view engine', "ejs");
    app.set('views', path.join(__dirname, '../views'));
}

module.exports = configViewEngine;