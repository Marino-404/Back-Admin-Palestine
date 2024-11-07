import { Injectable } from '@nestjs/common';
import { User } from './dto/create-user.dto';
import { Resend } from 'resend';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: User) {
    try {
      console.log(userData);
      const userExists = await this.prisma.user.findUnique({
        where: {
          email: userData.email,
        },
      });
      if (userExists && userData.messages.length > 0) {
        await this.prisma.user.update({
          where: {
            email: userData.email,
          },
          data: {
            messages: [...userExists.messages, userData.messages as string],
          },
        });
        return {
          status: 200,
          message: 'User messages updated successfully',
        };
      }
      const newUser = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          number: userData.number ? userData.number : '',
          messages: userData.messages ? [userData.messages as string] : [],
          createdAt: new Date(),
        },
      });

      console.log(newUser);

      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
          from: `Connect Palestine <conectados@connectpalestine.org>`,
          to: [userData.email],
          subject: '¡Bienvenid@ a Connect Palestine! 🇵🇸 🌍',
          html: `<div style="width:100%; max-width:500px; padding:4px; border-radius:6px; font-size:14px; font-family:Arial, Helvetica, sans-serif;">
          <div style="text-align:center;"><img style="width:50%;" src="${process.env.PRODUCTION_URL ? process.env.PRODUCTION_URL : process.env.DEV_URL}/public/logo.png" alt="Logo Connect Palestine" ></div>
          <div style="width:100%; margin:auto;">
            <h2 style=" font-size:18px; width:100%;">Hola <b>${userData.name}</b></h2>
            <p style="margin-top:0px; margin-bottom:8px;">¡Gracias por unirte a <b>Connect Palestine!</b></p>
            <p style="margin-top:0px; margin-bottom:8px;">Estamos encantados de que formes parte de nuestra comunidad, un espacio digital donde la cultura, historia y actualidad de Palestina encuentran su voz.</p>
            <p style="margin-top:0px; margin-bottom:8px;">Como suscriptor, recibirás nuestras últimas actualizaciones sobre <b>películas, series, arte, gastronomía, música</b>, y mucho más conectado con Palestina. También te mantendremos al tanto de eventos y proyectos especiales, para que no te pierdas ninguna oportunidad de conectar y ser parte de esta red de apoyo y difusión.</p>
            <p style="margin-top:0px; margin-bottom:8px;">Si tenés preguntas o sugerencias, no dudes en escribirnos. Nos encantaría saber cómo podemos mejorar tu experiencia en <b>Connect Palestine.</b></p>
            <p style="margin-top:0px; margin-bottom:8px; width:100%; ">¡Gracias por sumarte! Nos vemos pronto en tu bandeja de entrada.</p>
             <p style="margin-top:0px; margin-bottom:8px; width:100%; ">Un fuerte saludo, El equipo de <b>Connect Palestine</b></p>
            <p style="margin-top:0px; margin-bottom:8px; width:100%; text-align:end;">by <a href="https://instagram.com/palestinosrosario" target="_blank">@palestinosrosario</a></p>
          </div>
          </div>`,
        });

        if (error) {
          console.log(error);
        } else {
          console.log({ data });
        }
      } catch (e) {
        console.log('Email not sended');
        console.log(e);
      }

      return {
        status: 201,
        message: 'User created successfully',
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error creating user',
      };
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      return {
        status: 200,
        message: 'Users fetched successfully',
        data: users,
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error fetching users',
      };
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      return {
        status: 200,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error fetching user',
      };
    }
  }

  async update(updatedUserData: User) {
    try {
      await this.prisma.user.update({
        where: {
          id: updatedUserData.id,
        },
        data: {
          name: updatedUserData.name,
          email: updatedUserData.email,
          number: updatedUserData.number ? updatedUserData.number : '',
        },
      });
      return {
        status: 200,
        message: 'User updated successfully',
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error updating user',
      };
    }
  }

  async responseEmail({
    subject,
    title,
    message,
    userEmail,
    userMessage,
  }: {
    subject: string;
    title: string;
    message: string;
    userEmail: string;
    userMessage: string;
  }) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: `Connect Palestine <conectados@connectpalestine.org>`,
        to: userEmail,
        subject: subject,
        html: `<div style="width:100%; max-width:500px; padding:4px; border-radius:6px; font-size:14px; font-family:Arial, Helvetica, sans-serif;">
          <div style="text-align:center;"><img style="width:50%;" src="${process.env.PRODUCTION_URL ? process.env.PRODUCTION_URL : process.env.DEV_URL}/public/logo.png" alt="Logo Connect Palestine" ></div>
          <div style="width:100%; margin:auto;">
            <h2 style=" font-size:18px; width:100%;">${title}</h2>
            ${message
              .split('\n')
              .map(
                (line) =>
                  `<p style="margin-top:0px; margin-bottom:8px; word-break:break-all;">${line}</p>`,
              )
              .join('')}
            <p style="margin-top:0px; margin-bottom:8px; width:100%; text-align:end;">by <a href="https://instagram.com/palestinosrosario" target="_blank">@palestinosrosario</a></p>
          </div>
          </div> `,
      });

      if (error) {
        console.log(error);
        return {
          status: 500,
          message: 'Error enviando correo',
        };
      } else {
        console.log({ data });
      }

      return {
        status: 200,
        message: 'Se envio el correo correctamente',
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error enviando correo',
      };
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
      return {
        status: 200,
        message: 'User deleted successfully',
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error deleting user',
      };
    }
  }

  async sendEmailToAll({
    subject,
    title,
    message,
    emails,
  }: {
    subject: string;
    title: string;
    message: string;
    emails: string[] | null;
  }) {
    try {
      let mails = (await this.prisma.user.findMany()).map((user) => user.email);
      console.log(mails);

      if (emails && emails.length > 0) {
        mails = emails;
      }

      if (mails.length === 0) {
        return {
          status: 200,
          message: 'No hay usuarios para enviar correos',
        };
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data, error } = await resend.emails.send({
        from: `Connect Palestine <conectados@connectpalestine.org>`,
        to: 'info@connectpalestine.org',
        bcc: mails,
        subject: subject,
        html: `<div style="width:100%; max-width:500px; padding:4px; border-radius:6px; font-size:14px; font-family:Arial, Helvetica, sans-serif;">
          <div style="text-align:center;"><img style="width:50%;" src="${process.env.PRODUCTION_URL ? process.env.PRODUCTION_URL : process.env.DEV_URL}/public/logo.png" alt="Logo Connect Palestine" ></div>
          <div style="width:100%; margin:auto;">
            <h2 style=" font-size:18px; width:100%;">${title}</h2>
            ${message
              .split('\n')
              .map(
                (line) =>
                  `<p style="margin-top:0px; margin-bottom:8px; word-break:break-all;">${line}</p>`,
              )
              .join('')}
            <p style="margin-top:0px; margin-bottom:8px; width:100%; text-align:end;">by <a href="https://instagram.com/palestinosrosario" target="_blank">@palestinosrosario</a></p>
          </div>
          </div> `,
      });

      if (error) {
        console.log(error);
        return {
          status: 500,
          message: 'Error enviando correos',
        };
      } else {
        console.log({ data });
      }

      return {
        status: 200,
        message: 'Se enviaron los correos correctamente',
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        message: 'Error enviando correos',
      };
    }
  }
}
