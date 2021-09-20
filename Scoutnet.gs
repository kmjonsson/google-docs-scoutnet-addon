/**
 * Skapa PDF:er från scoutnet-lista på medlemmar, 
 * @author Magnus Jonsson <magnus.jonsson@tegsscoutkar.se>
 */

let debug = false;

// onOpen Trigger
function onOpen() {
  addMenu();
}

let ConfigHTML = `
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">
    <!-- The CSS package above applies Google styling to buttons and other elements. -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script>
      $(function() {
        google.script.run.withSuccessHandler(loadConfig).loadConfig();
        $("#spara").click(function() {
          $(this).prop('disabled',true);
          $("#error").html("");
          google.script.run.withFailureHandler(function() {
            error_msg("Misslyckades med att spara");
          }).withSuccessHandler(saved).saveConfig({
              'start_tag': $("#start_tag").val(),
              'end_tag':   $("#end_tag").val(),
              'groupid':   $("#groupid").val(),
              'api_key':   $("#api_key").val(),
              'filename_template':   $("#filename_template").val(),
            });
        });
        $("#close").click(function() {
          google.script.host.close();
        });
        $("#close").click(function() {
          google.script.run.withFailureHandler(function() {
            error_msg("Misslyckades med att glömma");
          }).withSuccessHandler(saved).forgetConfig();
          google.script.host.close();
        });
      });
      function saved() {
        google.script.host.close();
      }
      function error_msg(msg) {
        $("#spara").prop('disabled',false);
        $("#error").html(msg);
      }
      function loadConfig(config) {
        $("#start_tag").val(config['start_tag']);
        $("#end_tag").val(config['end_tag']);
        $("#groupid").val(config['groupid']);
        $("#api_key").val(config['api_key']);
        $("#filename_template").val(config['filename_template']);
        $("#loading").toggleClass('hidden');
        $("#cfg").toggleClass('hidden');
        $("#spara").prop('disabled',false);
      }
    </script>
    <style>
      td {
        padding-left: 5px;
      }
      .hidden {
         display: none;
      }
      input[type="text"] {
        width: 350px;
      }
    </style>
  </head>
  <body>
    <h1>Inställningar?</h1>
    <div id="loading">Laddar...</div>
    <div id="cfg" class="hidden">
      <table>
        <tr><td>Start tagg</td><td><input type="text" id="start_tag"></td></tr>
        <tr><td>Slut tagg</td><td><input type="text" id="end_tag"></td></tr>
        <tr><td>Filnamnsmall</td><td><input type="text" id="filename_template"></td></tr>
        <tr><td>Kår ID</td><td><input type="text" id="groupid" placeholder="Hämtas i Scoutnet om du har tillräckligt hög behörighet"></td></tr>
        <tr><td>API Nyckel</td><td><input type="text" id="api_key" placeholder="Hämtas i Scoutnet om du har tillräckligt hög behörighet"></td></tr>
      </table>
    </div>
    <input id="spara" type="button" value="Spara" disabled="true"/>
    <input id="close" type="button" value="Stäng"/>
    <input id="forget" type="button" value="Glöm Inställningar"/>
    <hr/>
    <div id="error">
    </div>
    <hr/>
    <div id="information">
      <p>
        KårID och API-Nyckel kan hämtas ur scoutnet för de som har rätt behörighet (Tex. IT-Ansvarig).
      </p>
      <p>
        API-nyckeln sparas bara för dig och ingen annan som har tillgång till dokumentet kan se den.<br/>
        Tänk på att API-nyckeln ger tillgång till väldigt mycket personuppgifter om samtliga medlemmar så
        behandla den med stor försiktighet. Om du tror att någon obehörig har fått tillgång till den
        kontakta IT-ansvarig i kåren omgånende.
      </p>
    </div>
  </body>
</html>
`;

let PageHTML = `
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">
    <!-- The CSS package above applies Google styling to buttons and other elements. -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script>
      let members={};
      $(function() {
        google.script.run.withSuccessHandler(loadMembers).loadMembers();
        $("#skapa").click(function() {
          //google.script.run.withSuccessHandler(loadPreferences).pushme("hej");
          let mem_no = $("input[type=checkbox]").map(function() {
             let x = $(this).is(':checked');
             if(!x) {
               return null;
             }
             let y = $(this).attr('memno');
             return y;
          });
          console.log(mem_no);
          $(this).prop('disabled',true);
          $("#text").html("");
          google.script.run.withFailureHandler(testarf).withSuccessHandler(testar).createMembers(mem_no.get());
        });
      });
      function testar() {
        $("#skapa").prop('disabled',false);
        $("#text").html("Generated OK :-)");
        console.log("OK");
      }
      function testarf() {
        $("#skapa").prop('disabled',false);
        $("#text").html("Failed to generate :-(");
        console.log("Failed");
      }
      function loadMembers(data) {
        members = data;
        let html = "<table>";
        let c = 0;
        for(let u in members) {
          html += "<tr class=\\"folder\\" unitu=\\"unit" + c + "\\"><td>&#x25b6;&nbsp;</td><td colspan=3>" + u + "</td></tr>";
          html += "<tr class=\\"hidden unit" + c + "\\"><td><input type=\\"checkbox\\" class=\\"select_all\\" unitu=\\"unit" + c + "\\"></td><td>Välj alla</td></tr>";
          for(let m of members[u]) {
            html += "<tr class=\\"hidden unit" + c + "\\"><td><input type=\\"checkbox\\" memno=\\"" + m['member_no'] + "\\"></td><td>" + m['member_no'] + "</td><td>" + m['first_name'] + "</td><td>" + m['last_name'] + "</td></tr>";
          }
          c++;
        }
        html += "</table>";
        $("#avd").html(html);
        $(".select_all").click(function() {
          let id = $(this).attr("unitu");
          console.log("select_all");
          console.log($(this).is(":checked"));
          console.log(id);
          let checked = $(this).is(":checked");
          $("." + id).find('input').prop('checked',checked);
        });
        $(".folder").click(function() {
          let id = $(this).attr("unitu");
          if($("." + id).hasClass('hidden')) {
            $(this).children().first().html("&#x25bc;");
          } else {
            $(this).children().first().html("&#x25b6;");
          }
          $("." + id).toggleClass('hidden');
        });
      }
    </script>
    <style>
      td {
        padding-left: 5px;
      }
      .hidden {
         display: none;
      }
    </style>
  </head>
  <body>
    <!-- <input type="button" value="Close" onclick="google.script.host.close()" /> -->
    <h1>Avdelningar</h1>
    <div id="avd">Loading...</div>
    <input id="skapa" type="button" value="Skapa"/>
    <hr/>
    <div id="text">
    </div>
  </body>
</html>
`;

/*
 * Config
 *
 */
function forgetConfig() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.deleteAllProperties();
}

function openConfig() {
   var html = HtmlService.createHtmlOutput(ConfigHTML)
      .setWidth(500).setHeight(600);
  DocumentApp.getUi().showModalDialog(html, 'Scoutnet Config');
}

function loadConfig() {
  var userProperties = PropertiesService.getUserProperties();
  var documentProperties = PropertiesService.getDocumentProperties();
  
  let groupid = documentProperties.getProperty('GROUP_ID');
  let start_tag = documentProperties.getProperty('START_TAG') || "{{";
  let end_tag = documentProperties.getProperty('END_TAG') || "}}";
  let api_key = userProperties.getProperty('API_KEY');
  let filename_template = documentProperties.getProperty('FILENAME_TEMPLATE') || "{{unit}} - {{member_no}} - {{first_name}} {{last_name}}";
  return {
    start_tag,
    end_tag,
    api_key,
    groupid,
    filename_template,
  };
}
    
function saveConfig(config) {
  var userProperties = PropertiesService.getUserProperties();
  var documentProperties = PropertiesService.getDocumentProperties();
  
  if(config['start_tag'].length == 0 || config['end_tag'].length == 0 || config['groupid'].length == 0 || config['api_key'].length == 0 || config['filename_template'].length == 0) {
    throw new Error( "Missing config..." );
  }
  documentProperties.setProperty('GROUP_ID',config['groupid']);
  documentProperties.setProperty('START_TAG',config['start_tag']);
  documentProperties.setProperty('END_TAG',config['end_tag']);
  documentProperties.setProperty('FILENAME_TEMPLATE',config['filename_template']);
  userProperties.setProperty('API_KEY',config['api_key']);
}
    
function getDocumentConfig(key) {
  var documentProperties = PropertiesService.getDocumentProperties();
  let cfg = documentProperties.getProperty(key);
  if(!cfg) {
    openConfig();
    return null;
  }
  return cfg;
}

function getFilenameTemplate() {
  return getDocumentConfig('FILENAME_TEMPLATE');
}

function getGroupId() {
  return getDocumentConfig('GROUP_ID');
}

function getStartTag() {
  return getDocumentConfig('START_TAG');
}

function getEndTag() {
  return getDocumentConfig('END_TAG');
}

function getApiKey() {
  var userProperties = PropertiesService.getUserProperties();
  let api_key = userProperties.getProperty('API_KEY');
  if(!api_key) {
    openConfig();
    return null;
  }
  return api_key;
}

function checkConfig() {
  let docs = ['START_TAG','END_TAG','GROUP_ID','FILENAME_TEMPLATE'];
  for(let k of docs) {
    if(!getDocumentConfig(k)) {
      return false;
    }
  }

  // Kårens Scoutnet API-nyckel
  if(!getApiKey()) {
    return false;
  }

  return true;
}
    
/*
 * Menyer
 *
 */

let labels = {
    "member_no": "Medlemsnr.",
    "first_name": "Förnamn",
    "last_name": "Efternamn",
    "ssno": "Personnummer",
    "date_of_birth": "Födelsedatum:",
    "group": "Kår",
    "unit": "Avdelning",
    "patrol": "Patrull",
    "unit_role": "Avdelningsfunktion",
    "address_co": "c/o",
    "address_1": "Adress",
    "address_2": "Adress, rad 2",
    "address_3": "Adress, rad 3",
    "postcode": "Postnummer",
    "town": "Postort",
    "country": "Land",
    "email": "Primär e-postadress",
    "contact_alt_email": "Alternativ e-post",
    "contact_mobile_phone": "Mobiltelefon",
    "contact_home_phone": "Hemtelefon",
    "contact_mothers_name": "Anhörig 1 namn",
    "contact_email_mum": "Anhörig 1 e-post",
    "contact_mobile_mum": "Anhörig 1 mobiltelefon",
    "contact_fathers_name": "Anhörig 2 namn",
    "contact_email_dad": "Anhörig 2 e-post",
    "contact_mobile_dad": "Anhörig 2 mobiltelefon",
    "contact_leader_interest": "Jag kan hjälpa till!",
    "contact_work_phone": "Arbetstelefon",
    "contact_email": "E-post",
    "contact_mobile_home": "Mobil hem",
    "contact_mobile_me": "Mobil medlem",
    "contact_mobile_work": "Mobil jobb",
    "contact_maalsmans_e_post": "Målsmans e-post",
    "contact_maalsmans_mobil": "Målsmans mobil",
    "contact_telephone_me": "Telefon medlem",
};

function addMenu() {
  let ui = DocumentApp.getUi(); // Or DocumentApp or SlidesApp or FormApp.
  let menu = ui.createMenu('Scoutnet');
  menu.addItem('Skapa', 'showDialog');
  let sub = ui.createMenu('Insert');
  for(let key in labels) {
    sub.addItem(labels[key],'insert_' + key);
  }
  menu.addSeparator();
  menu.addSubMenu(sub);
  menu.addSeparator();
  menu.addItem('Inställningar', 'openConfig');
  menu.addToUi();
}

function insert_tag(tag) {
  if(!checkConfig()) {
    return;
  }

  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor) {
    var element = cursor.insertText(getStartTag() + tag + getEndTag());
    if(!element) {
      DocumentApp.getUi().alert('Kan inte stoppa in text i den aktuella positionen');
    }
  } else {
    DocumentApp.getUi().alert('Kan inte hitta en "cursor" i aktuellt dokument');
  }
}
  
// Insert functions
function insert_member_no() { insert_tag('member_no'); }
function insert_first_name() { insert_tag('first_name'); }
function insert_last_name() { insert_tag('last_name'); }
function insert_ssno() { insert_tag('ssno'); }
function insert_date_of_birth() { insert_tag('date_of_birth'); }
function insert_group() { insert_tag('group'); }
function insert_unit() { insert_tag('unit'); }
function insert_patrol() { insert_tag('patrol'); }
function insert_unit_role() { insert_tag('unit_role'); }
function insert_address_co() { insert_tag('address_co'); }
function insert_address_1() { insert_tag('address_1'); }
function insert_address_2() { insert_tag('address_2'); }
function insert_address_3() { insert_tag('address_3'); }
function insert_postcode() { insert_tag('postcode'); }
function insert_town() { insert_tag('town'); }
function insert_country() { insert_tag('country'); }
function insert_email() { insert_tag('email'); }
function insert_contact_alt_email() { insert_tag('contact_alt_email'); }
function insert_contact_mobile_phone() { insert_tag('contact_mobile_phone'); }
function insert_contact_home_phone() { insert_tag('contact_home_phone'); }
function insert_contact_mothers_name() { insert_tag('contact_mothers_name'); }
function insert_contact_email_mum() { insert_tag('contact_email_mum'); }
function insert_contact_mobile_mum() { insert_tag('contact_mobile_mum'); }
function insert_contact_fathers_name() { insert_tag('contact_fathers_name'); }
function insert_contact_email_dad() { insert_tag('contact_email_dad'); }
function insert_contact_mobile_dad() { insert_tag('contact_mobile_dad'); }
function insert_contact_leader_interest() { insert_tag('contact_leader_interest'); }
function insert_contact_work_phone() { insert_tag('contact_work_phone'); }
function insert_contact_email() { insert_tag('contact_email'); }
function insert_contact_mobile_home() { insert_tag('contact_mobile_home'); }
function insert_contact_mobile_me() { insert_tag('contact_mobile_me'); }
function insert_contact_mobile_work() { insert_tag('contact_mobile_work'); }
function insert_contact_maalsmans_e_post() { insert_tag('contact_maalsmans_e-post'); }
function insert_contact_maalsmans_mobil() { insert_tag('contact_maalsmans_mobil'); }
function insert_contact_telephone_me() { insert_tag('contact_telephone_me'); }

/*
 * Huvud-dialog
 */

function showDialog() {
  if(!checkConfig()) {
    return;
  }
  var html = HtmlService.createHtmlOutput(PageHTML)
      .setWidth(500).setHeight(600);
  DocumentApp.getUi().showModalDialog(html, 'Scoutnet');
}

function loadMembers() {
  let members = fetchFromScoutnet();
  let res = {};
  for(let m of members) {
    if(!(m['unit'] in res)) {
      res[m['unit']] = [];
    }
    if(m['member_no'] != '3329444' && m['member_no'] != '3010565') {
      //continue;
    }
    res[m['unit']].push({
      'member_no': m['member_no'],
      'first_name': m['first_name'],
      'last_name': m['last_name'],
      'unit': m['unit'],
    });
  }
  return res;
}

function createMembers(ids) {
  let current_folder = DriveApp.getFileById(DocumentApp.getActiveDocument().getId()).getParents().next();
  let target_folder = current_folder.createFolder(new Date().toISOString()).getId();
  let members = fetchFromScoutnet();
  for(let m of members) {
    if(ids.indexOf(m['member_no']) != -1) {
      generateDocument(m,target_folder);
    }
  }
}

/**
 * Duplicates a Google Apps doc
 *
 * @return a new document with a given name from the orignal
 */
function createDuplicateDocument(sourceId, name, targetFolder_id) {
  var source = DriveApp.getFileById(sourceId);
  var targetFolder = DriveApp.getFolderById(targetFolder_id);  
  var newFile = source.makeCopy(name,targetFolder);
  return DocumentApp.openById(newFile.getId());
}

function moveFileId(fileId, toFolderId) {
   var file = DriveApp.getFileById(fileId);
   var source_folder = DriveApp.getFileById(fileId).getParents().next();
   var folder = DriveApp.getFolderById(toFolderId);
   folder.addFile(file);
   source_folder.removeFile(file);
}

function generateDocument(member, targetFolder_id) { 
  // Skapa ett filnamn från FILENAME_TEMPLATE med hjälp av data hämtas från scoutnet.
  var file_name = getFilenameTemplate();
  for(let [key, value] of Object.entries(member)) {
    key = getStartTag() + key + getEndTag(); 
    file_name = file_name.replace(key,value);
  }    

  // Skapa en kopia av template-dokumentet
  var target = createDuplicateDocument(DocumentApp.getActiveDocument().getId(), file_name, targetFolder_id );
  var targetId = target.getId();
  //Logger.log("Nytt dokument:" + target.getId());
  
  // Ersätt förekomster av startTag key endTag i dokumentet.
  var body = target.getActiveSection();  
  for(let [key, value] of Object.entries(member)) {
    key = getStartTag() + key + getEndTag(); 
    target.getBody().replaceText(key,value);
  }
  target.saveAndClose();
  
  // Konvertera till PDF
  var pdf = target.getAs('application/pdf');
  pdf.setName(target.getName() + ".pdf");    
  var pdfFile = DriveApp.createFile(pdf);
  var fileId = pdfFile.getId();
  moveFileId(fileId,targetFolder_id);
  
  // Ta bort google dokumentet  
  var folder = DriveApp.getFolderById(targetFolder_id); 
  folder.removeFile(DriveApp.getFileById(targetId));
}

var scoutnet_url = 'www.scoutnet.se'; //Scoutnets webbadress

/*
 * Hämta alla medlemmar
 */
function fetchFromScoutnet() {
  // Litet dataset för test/utveckling för att slippa anropa scoutnet.
  if(debug) {
    return [
      {
        'unit': "Testavdelning",
        'member_no': "123456",
        'first_name': "Test",
        'last_name': "Testsson",
        'group': "Test Scoutkår",
        'email': 'email@example.com',
        'address_1':"Testgatan 10", 'address_2': "" , 'address_3':"", 'postcode': '12345', 'town':'Testfield',
        'contact_mobile_phone':'555-654 321', 'contact_home_phone': '555-123 456',
        'contact_mothers_name':"Mamma Testsson",'contact_mobile_mum':'555-111 222','contact_email_mum':'mamma@example.com',
        'contact_fathers_name':"Pappa Testsson",'contact_mobile_dad':'555-333 222','contact_email_dad':'pappa@example.com',

      }
    ];
  }

  var url = 'https://' + scoutnet_url + '/api/group/memberlist?id=' + getGroupId() + '&key=' + getApiKey(); // + '&pretty=1';
  var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  
  var json = response.getContentText();
  var data = JSON.parse(json);
  
  var fields = ['member_no', 'first_name', 'last_name', 'ssno', 'date_of_birth', 'status', 'group',
                  'unit', 'address_co', 'address_1', 'address_2' , 'address_3', 'postcode', 'town',
                  'country', 'contact_mobile_phone', 'contact_home_phone', 'contact_mothers_name',
                  'contact_mobile_mum', 'contact_telephone_mum', 'contact_fathers_name', 'contact_mobile_dad',
                  'contact_telephone_dad','email', 'contact_email_mum', 'contact_email_dad', 
                  'contact_alt_email', 'extra_emails'];

  var allMembers = [];
  for (medlem of Object.values(data.data)) {
    var member = {};
    for(f of fields) {
      member[f] = medlem[f] ? medlem[f].value : "";
    }
    allMembers.push(member);
  } 
  return allMembers;  
}
  
// End Of File
