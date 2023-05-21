module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
			'eslint:recommended',
			'plugin:wc/recommended',
			'plugin:lit/recommended',
		],
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
			"no-unused-vars": "warn",
    }
}
