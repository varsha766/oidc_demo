export const pi = async (req, res) => {
    res.status(200).send(Math.PI.toString())
}