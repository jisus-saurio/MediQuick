const logoutController = {};

logoutController.logout = async (req, res) => {

    res.clearCookies("authToken");

    res.json({ message: "Logged out successfully" });

}

export default logoutController;