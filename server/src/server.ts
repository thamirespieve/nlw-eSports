import express from "express"
import cors from 'cors' 

import {PrismaClient} from "@prisma/client"
import { convertHoursStringToMinutes } from "./utils/convert-hour-string-to-minutes"
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string"

const app = express()
app.use(express.json())
app.use(cors())
const prisma = new PrismaClient({
  log:['query']
})


const PORT = 3333


// HTTP methods / API RESTful
// HTTP Codes = Mostra se a resposta é valida
/* Tipos de parametros
Query = vem atraves do ?, sempre são nomeados, e acessados pela URL
Route = Também vem pela URL, porem não são nomeados
Body  = Envia varias informações pelo corpo. Geralmente urilizado para formulario 
*/

app.get("/games",async (request,response)=>{

  const games = await prisma.game.findMany({
    include:{
      _count:{
        select:{
          ads:true,
        }
      }
  }})

  return response.json(games)
})

app.post("/games/:id/ads",async(request,response)=>{

  const gameId = request.params.id
  const body:any = request.body

  const ad = await prisma.ad.create({
    data:{
      gameId,
      name             : body.name,
      yearsPlaying     : body.yearsPlaying,
      discord          : body.discord,
      weekDays         : body.weekDays.join(','),
      hourStart        : convertHoursStringToMinutes(body.hourStart),
      hourEnd          : convertHoursStringToMinutes(body.hourEnd),
      userVoiceChannel : body.userVoiceChannel,
       
    }
  })

  return response.json(ad)
})

app.get("/games/:id/ads", async(request,response)=>{

  const gameId =request.params.id

  const ads = await prisma.ad.findMany({
    select:{
      id:true,
      name:true,
      weekDays:true,
      userVoiceChannel:true,
      yearsPlaying:true,
      hourStart:true,
      hourEnd:true
    },
    where:{
      gameId
    },
    orderBy:{
      createAt:'desc'
    }
  })

  return response.json(ads.map(ad=>{
    return {
      ...ad,
      weekDays:ad.weekDays.split(','),
      hourStart:convertMinutesToHourString(ad.hourStart),
      hourEnd:convertMinutesToHourString(ad.hourEnd),
    }
  }))
})

app.get("/ads/:id/discord",async(request,response)=>{

  const adId= request.params.id

  const ad = await prisma.ad.findUniqueOrThrow({
    select:{
      discord:true
    },
    where:{
      id:adId
    }

  })
  return response.json({
    discord:ad.discord
  })
})

app.listen(PORT)