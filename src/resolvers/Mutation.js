const { hash, compare } = require('bcrypt')
const { sign } = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

const Mutation = {
  signup: async (parent, { name, email, password }, context) => {
    const hashedPassword = await hash(password, 10)
    const user = await context.photon.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    }
  },
  login: async (parent, { email, password }, context) => {
    const user = await context.photon.users.findOne({
      where: {
        email,
      },
    })
    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }
    const passwordValid = await compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid password')
    }
    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    }
  },
  createDraft: async (parent, { title, content }, context) => {
    const userId = getUserId(context)
    return context.photon.posts.create({
      data: {
        title,
        content,
        published: false,
        // author: { connect: { id: userId } },
      },
    })
  },
  deletePost: async (parent, { id }, context) => {
    return context.photon.posts.delete({
      where: {
        id,
      },
    })
  },
  publish: async (parent, { id }, context) => {
    console.log('fire resolver')
    return context.photon.posts.update({
      where: { id },
      data: { published: true },
    })
  },
}

module.exports = {
  Mutation,
}
