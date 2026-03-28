"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validLoginRequest = exports.validRegisterRequest = void 0;
const validRegisterRequest = (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role)
            throw new Error("Provide valid details");
        next();
    }
    catch (err) {
        res.status(400).json({ message: err });
    }
};
exports.validRegisterRequest = validRegisterRequest;
const validLoginRequest = (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            throw new Error("Provide valid details");
        next();
    }
    catch (err) {
        // res.status(400).json({ message: err?.message });
        res.status(400).json({ message: "something went wrongs" });
    }
};
exports.validLoginRequest = validLoginRequest;
