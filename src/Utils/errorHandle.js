let stackVar;
export const asyncHandle = (API) => {
    return (req, res, next) => {
        API(req, res, next).catch(err => {
            stackVar = err.stack;
            return next(new Error(err), { cause: 500 })
        })
    }
}

export const globalErrorHandle = (err, req, res, next) => {
    if (err) {
        if (process.env.MOOD == "DEV") {
            return res.status(err.cause || 500).json({ message: err.message, err, stack: stackVar })
        }
        return res.status(err.cause || 500).json({ message: err.message })
    }
}