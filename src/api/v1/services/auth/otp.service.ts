import bcrypt from 'bcrypt'
import otpGenerator from 'otp-generator'
import logEvent from '~/v1/helpers/log-event'
import { ResponseStory } from '~/v1/middleware/express-formatter'
import OTPSchema from '~/v1/models/auth/otp.model'
import logging from '~/v1/utils/logging'
import { createExpiryDate, isExpired } from '~/v1/utils/timer'

const NAMESPACE = 'services/otp'

export const generateAndSaveOTP = async (email: string): Promise<ResponseStory> => {
  try {
    // Generate otp code..
    const otpGenerated = otpGenerator
      .generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
      .toString()
    // Hash otp code..
    const salt = bcrypt.genSaltSync(10)
    const hashOtp = bcrypt.hashSync(otpGenerated, salt)
    // Create a new expired date..
    const expiryDate = createExpiryDate()
    // Send otp to email..
    await sendMailOTPCode(otpGenerated, hashOtp)
    // Insert otp to database..
    const otp = await OTPSchema.create({ email: email, otp: hashOtp, expiryDate: expiryDate.toISOString() })
    return {
      status: otp ? 200 : 400,
      message: otp ? 'OTP Generated!!' : `Could not create otp for ${email}`,
      data: otp ? otp : null
    }
  } catch (e) {
    logEvent(`${e}`)
    logging.error(NAMESPACE, `${e}`)
    throw new Error(`${e}`)
  }
}

// Get all
export const sendMailOTPCode = async (otpCheck: string, hashOtp: string): Promise<ResponseStory> => {
  try {
    const isValid = bcrypt.compareSync(otpCheck, hashOtp)
    return {
      status: isValid ? 200 : 400,
      message: 'Send mail otp code..',
      meta: {
        isValid: isValid,
        originOtpCode: otpCheck,
        hashOtp: hashOtp
      }
    }
  } catch (e) {
    logging.error(NAMESPACE, `${e}`)
    logEvent(`${e}`)
    throw Error(`${e}`)
  }
}

// Get all
export const verifyAndDeleteOTP = async (email: string, otpCheck: string): Promise<ResponseStory> => {
  try {
    const otpRecord = await OTPSchema.findOne({
      where: {
        email: email,
        otp: otpCheck
      }
    })
    if (otpRecord) {
      if (isExpired(new Date(otpRecord.expiryDate))) {
        return {
          status: 400,
          message: 'Expired date!'
        }
      } else {
        await otpRecord.destroy()
        return {
          status: 200,
          message: 'OTP verified!'
        }
      }
    } else {
      return {
        status: 400,
        message: 'Can not find otp code!'
      }
    }
  } catch (e) {
    logging.error(NAMESPACE, `${e}`)
    logEvent(`${e}`)
    throw new Error(`${e}`)
  }
}