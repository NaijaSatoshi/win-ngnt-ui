const path = require('path');

module.exports = {
    entry: {
        global: './src/js/global.js',
        home: './src/js/home.js',
        tickets: './src/js/tickets.js',
        winners: './src/js/winners.js',
        endGame: './src/js/end-game.js',
    },
    output: {
        path: path.resolve(__dirname, 'src', 'assets', 'js')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            }
        ],
    },
};
