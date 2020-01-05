generateMessage = ( username, text ) => {
	return {
		username,
		text,
		createdAt: new Date().getTime()
	}
};

generateLocationMessage = ( username, position ) => {
	return {
		username,
		url: `https://google.com/maps?q=${position.latitude},${position.longitude}`,
		createdAt: new Date().getTime()
	}
};

module.exports = {
	generateMessage,
	generateLocationMessage
};