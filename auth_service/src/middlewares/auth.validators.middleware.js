export const validRegisterRequest = (req, res, next) => {
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
export const validLoginRequest = (req, res, next) => {
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
