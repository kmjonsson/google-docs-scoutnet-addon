# google-docs-scoutnet-addon

Plugin för att skapa koppladde dokument från scoutnet i google docs.

Kan tex användas för att förifylla hälsodeklarationer vid terminsstart med 
information från Scoutnet eller för att skapa personliga inbjudningskort till 
hajk eller annat evenemang.

# Installera

## Skapa ett google document

## Lägg till plugin

1. Under Verktygsmenyn välj "Scriptredigerare".

2. Byt ut allt i Kod.gs till innehållet i Scoutnet.gs.

3. Spara (Ctrl-S) och ladda sedan om dokumentet.

4. Klart.

## Scoutnet-menyn

I Ditt dokument ska det nu finnas en Scoutnet-meny.

Första gången något används kommer det komma en fråga från Google om ett antal
rättigheter som behövs för att köra.

Under inställningar får du fylla i din kårs scoutnet-ID och
den API-nyckel som använda för att hämta hem information från scoutnet.

Man kan även ändra på taggar för det som ska bytas ut och hur filnamnet som skapas ska se ut.

Infoga-menyn används för att infoga taggar som kommer att bytas ut mot
motsvarande information i scoutnet.

Under "Skapa" får man en lista på avdelningar och scouter och kan kryssa
i för vilja man vill skapa dokument.

Trycker man sedan på skapa kommer en ny katalog att skapas med dagens datum och tid
där PDF:er med de nyskapade dokumenten. Skapandet tar lite tid så ha tålamod.
