import bcrypt from "bcryptjs";
import {
  DocumentType,
  getModelForClass,
  modelOptions,
  pre,
  prop,
  Ref,
} from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  },
  options: {
    enableMergeHooks: true, // needs to be set, because by default typegoose does not need de-duplication
  },
})

// @pre('save', (){
// hash password on user creation
// })
export class User {
  @prop({ required: true })
  public name!: string;

  @prop({ required: false, unique: true })
  public username?: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: false, default: false })
  public emailVerified!: string;

  @prop({ required: false })
  public password?: string;

  @prop({ required: false })
  public emailAuthToken?: string;

  // extra Fields
  @prop({ required: false })
  public role!: string;

  @prop({ required: false })
  public profile?: string;

  // the "this" definition is required to have the correct types
  public comparePassword(this: DocumentType<User>, inputPassword: string) {
    return bcrypt.compareSync(inputPassword, this.password!);
  }
  public verifyAuthToken(this: DocumentType<User>, token: string) {
    return bcrypt.compareSync(token.toString(), this.emailAuthToken!);
  }
}

export const userModel = getModelForClass(User);
