type MarkdownTextProps = {
  content: string
}

export function MarkdownText({ content }: MarkdownTextProps) {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    
    return lines.map((line, i) => {
      // handle links [text](url)
      let processed = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>')
      
      // handle bold **text**
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      
      // handle italic *text*
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>')
      
      // handle lists - lines starting with - or *
      if (/^[\-\*]\s/.test(line)) {
        processed = processed.replace(/^[\-\*]\s/, '• ')
        return (
          <div key={i} style={{ marginLeft: '8px' }}>
            <span dangerouslySetInnerHTML={{ __html: processed }} />
          </div>
        )
      }
      
      return (
        <div key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
        </div>
      )
    })
  }
  
  return <div>{renderMarkdown(content)}</div>
}
