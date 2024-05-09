const fs = require('fs');
const path = require('path');
const marked = require('marked');


const srcDirectory = path.join(__dirname, '../src/content');
const destDirectory = path.join(__dirname, '../public/content');
const outputJson = path.join(destDirectory, 'noteList_p.json');
const outputJson_1 = path.join(destDirectory, 'noteList_s.json');


const readMarkdown = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    return marked.parse(content);
};

const saveHtml = (html, outputPath) => {
    fs.writeFileSync(outputPath, html, 'utf8');
};

const convertMdToHtml = (srcD, destD) => {
    const files = fs.readdirSync(srcD);
    files.forEach(file => {
        if (file.endsWith('.md')) {
            const filePath = path.join(srcD, file);
            const html = readMarkdown(filePath);
            const htmlFileName = file.replace('.md', '.html');
            const htmlFilePath = path.join(destD, htmlFileName);
            saveHtml(html, htmlFilePath);
        }
    });
    updateNoteList();
};

const updateNoteList = () => {
    const htmlFiles = fs.readdirSync(destDirectory).filter(file => file.endsWith('.html'));
    const notes = htmlFiles.map(file => ({
        fileName: file.replace('.html', ''),
        title: file.replace('.html', '')
    }));

    fs.writeFileSync(outputJson, JSON.stringify(notes, null, 2), 'utf8');
    console.log('public noteList.json has been updated.');
};

fs.watch(srcDirectory, (eventType, filename) => {
    if (filename) {
        console.log(`Detected ${eventType} in ${filename}`);
        convertMdToHtml(srcDirectory, destDirectory);
    }
});

console.log(`Watching for file changes in ${srcDirectory}`);

let postlist = []

const getPosts = () => {
    const promises = [];
    fs.readdir(srcDirectory, (err, files) => {
        console.log("There are " + files.length + " files in the content folder.")
        if (err) {
            console.error('Failed to read directory:', err);
            return;
        }
        files.forEach((file, i) => {
            promises.push(new Promise((resolve, reject) => {
                let obj = {}
                let post
                fs.stat(`${srcDirectory}/${file}`, (err, stats) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (stats.isFile()) { // Check if it's a file
                        fs.readFile(`${srcDirectory}/${file}`, "utf8", (err, contents) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            const getMetadataIndices = (acc, elem, i) =>{
                                if (/^---/.test(elem)){
                                    acc.push(i)
                                }
                                return acc
                            }
                            const parseMetadata = ({lines, metadataIndices}) =>{
                                if (metadataIndices.length > 0){
                                    let metadata = lines.slice(metadataIndices[0] + 1,metadataIndices[1])
                                    metadata.forEach(line => {
                                        let l = line.split(": ")
                                        obj[l[0]] = l[1]
                                    })
                                    return obj
                                }
                            }
                            const parseContent = ({lines,metadataIndices}) =>{
                                if (metadataIndices.length > 0){
                                    lines = lines.slice(metadataIndices[1] + 1, lines.length)
                                }
                                return lines.join('\n')
                            }
                            const lines = contents.split('\n')
                            const metadataIndices = lines.reduce(getMetadataIndices,[])
                            const metadata = parseMetadata({lines,metadataIndices})
                            const content = parseContent({lines, metadataIndices})
                            post = {
                                id: i+1,
                                ...metadata,
                                title: metadata.title ? metadata.title : "No title",
                                author: metadata.author ? metadata.author : "No author",
                                date: metadata.date ? metadata.date : "No date",
                                content: content ? content : "No content",
                            }
                            postlist.push(post)
                            
                            resolve();
                        });
                    } else {
                        resolve(); // Resolve immediately if it's a directory
                    }
                });
            }));
        });
        Promise.all(promises)
            .then(() => {
                console.log(postlist.length + " are readable.")
                fs.writeFileSync(outputJson_1, JSON.stringify(postlist, null, 2), err => {
                    if (err) {
                        console.error('Failed to write note list:', err);
                        return;
                    }
                    console.log('src noteList.json has been updated.');
                });
            })
            .catch(err => {
                console.error('Failed to read file:', err);
            });
    });
}


getPosts()