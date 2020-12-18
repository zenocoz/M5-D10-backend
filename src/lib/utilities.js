const { readJson, writeJson } = require("fs-extra")

const readDB = async (filePath) => {
  try {
    const fileJSON = await readJson(filePath)
    return fileJSON
  } catch (error) {
    throw new Error(error)
  }
}

const writeDB = async (filePath, data) => {
  try {
    await writeJson(filePath, data)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  readDB,
  writeDB,
}
